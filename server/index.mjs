import express from 'express';
import UserDao from './dao/userDAO.mjs';
import morgan from 'morgan';
import Proposal, { Vote } from './models/proposal.mjs';
import { ProposalsNotFoundError, VoteOwnProposalError, ProposalAlreadyVoteError, UserHaveTooManyProposalsError, PreferencesNotFoundError } from './Errors/proposalsError.mjs';
import { UserNotAuthorizedError } from './Errors/usersError.mjs';
import passport from 'passport';                              
import LocalStrategy from 'passport-local'; 
import session from 'express-session';
import cors from 'cors';
import { check, validationResult } from 'express-validator';
import ProposalDao from './dao/proposalDAO.mjs';
import BudgetDao from './dao/budgetDAO.mjs';
import ResetAllDAO from './dao/resetAllDAO.mjs';
import { Role } from './models/User.mjs';
import { BudgetNotFoundError, PhaseNotFoundError, BudgetAlreadyExistError, NotInRightPhaseError } from "./Errors/budgetError.mjs";




const proposalsDao = new ProposalDao();
const userDao = new UserDao();
const budgetDao = new BudgetDao();
const resetAllDao = new ResetAllDAO();

const app = new express();
app.use(express.json());
app.use(morgan('dev'));
const port = 3001;

//Cross-Origin Resource Sharing (CORS)
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));

/*** Authentication ***/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUserByCredentials(username, password)
  if(!user)
    return callback(null, false, 'Incorrect username or password');

  return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUserByCredentials(), i.e, id, username, name)
}));

passport.serializeUser(function (user, callback) { // this user is id + username + name
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name
  return callback(null, user); // this will be available in req.user

  // In this method, if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));
});

/*** Session ***/
app.use(session({
  secret: "This is a very secret information used to initialize the session!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

/*** Utility Functions ***/
const onValidationErrors = (validationResult, res) => {
  const errors = validationResult.formatWith(errorFormatter);
  return res.status(422).json({validationErrors: errors.mapped()});
};

const errorFormatter = ({msg}) => {
  return msg;
};



const proposalValidator = [
  check('description').optional().isString().notEmpty(),
  check('cost').optional().isNumeric().notEmpty()
];


/*** User APIs ***/
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);

        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUserByCredentials() in LocalStratecy Verify Function
        return res.json(req.user);
      });
  })(req, res, next);
});

 // GET /api/sessions/current
  // This route checks whether the user is logged in or not.
  app.get('/api/sessions/current', (req, res) => {
    if(req.isAuthenticated()) {
      res.status(200).json(req.user);}
    else
      res.status(401).json({error: 'Not authenticated'});
  });

  app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
      res.end();
    });
  });



/*** Proposals APIs ***/

/**
 * API endpoint for getting all proposals of a user
 */
app.get('/api/proposals/:userId', isLoggedIn,
  async (req, res) => {
  try {
    const result = await proposalsDao.getProposalsById(req.params.userId);
    res.json(result)
  } catch (err) {
      if(err instanceof ProposalsNotFoundError) {
          res.status(404).json({error: err.customMessage});
      } else {
          res.status(500).json({error: 'Error while getting proposals'});
      }
    
  }
});

/**
 * API endpoint for getting all proposals
 */
app.get('/api/proposals', isLoggedIn,
  async (req, res) => {
  try {
    const result = await proposalsDao.getAllProposals();
    res.json(result)
  } catch (err) {
    if(err instanceof ProposalsNotFoundError) {
      res.status(404).json({error: err.customMessage});
    } else {
      res.status(500).end();
    }
  }
});

/**
 * API endpoint for deleting a proposal
 */
app.delete('/api/proposals/:id', isLoggedIn, async (req, res) => {
  try {
    const result = await proposalsDao.deleteProposal(req.params.id, req.user.id);
    res.json(result);
    } catch (err) {
    if (err instanceof ProposalsNotFoundError) {
      return res.status(404).json({ error: err.customMessage });
    } else if (err instanceof UserNotAuthorizedError) {
      return res.status(403).json({ error: err.customMessage });
    } else if(err instanceof NotInRightPhaseError) {
      return res.status(403).json({ error: err.customMessage });
    } else {
      res.status(500).json({ error: 'Error while deleting the proposal' });

    }
  }
});

  

/**
 * API endpoint for adding a proposal
 */
app.post('/api/proposals/add', isLoggedIn, proposalValidator, async (req, res) => {
  const invalidData = validationResult(req);

  if (!invalidData.isEmpty()) {
      return onValidationErrors(invalidData, res);
  }

  const proposal = new Proposal(null, req.user.id, req.body.description, req.body.cost);
  try {
      const result = await proposalsDao.addProposal(proposal, req.user.id);
      res.json(result);
  } catch (err) {
      if (err instanceof UserHaveTooManyProposalsError) {
          res.status(403).json({ error: err.customMessage });
      } else if(err instanceof BudgetNotFoundError) {
        res.status(404).json({ error: err.customMessage})
      } else if(err instanceof NotInRightPhaseError) {
        res.status(403).json({ error: err.customMessage });
      } else {
          res.status(500).json({ error: 'Error while adding proposal' });
      }
  }
});



/**
 * API endpoint for update an existing proposal both description and cost
 */
app.put('/api/proposals/:id', isLoggedIn, proposalValidator, async (req, res) => {
  const invalidData = validationResult(req);

  if (!invalidData.isEmpty()) {
    return onValidationErrors(invalidData, res);
  }

  const proposal = {
    id: Number(req.params.id),
    user_id: req.user.id,  
    description: req.body.description,
    cost: req.body.cost
  };

  try {
    const result = await proposalsDao.updateProposal(proposal, proposal.id, req.user.id);
    res.json(result)
  } catch (err) {
    if (err instanceof ProposalsNotFoundError) {
      res.status(404).json({ error: err.customMessage });
    } else if (err instanceof UserNotAuthorizedError) {
      res.status(403).json({ error: err.customMessage });
    } else if(err instanceof NotInRightPhaseError) {
      res.status(403).json({ error: err.customMessage });
    } else {
      res.status(500).json({ error: 'Error while updating the proposal' });
    }
  }
});



/**
 * API endpoint for vote a proposal
 */
app.post('/api/proposals/:id/vote', isLoggedIn, [
  check('score').isInt({ min: 1, max: 5 }).notEmpty()
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const vote = new Vote(req.user.id, req.params.id, req.body.score);
  try {
    const result = await proposalsDao.addPreferenceToProposal(req.user.id, vote.prop_id, vote.score);
    res.json(result);
  } catch(err) {
    if (err instanceof ProposalsNotFoundError) {
      res.status(404).json({ error: err.customMessage });
    } else if (err instanceof VoteOwnProposalError) {
      res.status(400).json({ error: err.customMessage });
    } else if (err instanceof ProposalAlreadyVoteError) {
      res.status(409).json({ error: err.customMessage });
    } else if(err instanceof NotInRightPhaseError) {
      res.status(403).json({ error: err.customMessage });
    } else {
      res.status(500).json({ error: 'Error while voting proposal' });
    }
  }
});


/**
 * API endpoint for getting all preferences made by a user
 */
app.get('/api/preferences/:userId', isLoggedIn, async (req, res) => {
  try {
       // ID dell'utente autenticato che fa la richiesta
      const target_user_id = Number(req.params.userId);
      const requesting_user_id = Number(req.user.id);

      if (requesting_user_id !== target_user_id) {
        throw new UserNotAuthorizedError();
    }
      
      const result = await proposalsDao.getAllPreferences(requesting_user_id);
      res.json(result);
  } catch (err) {

      if (err instanceof PreferencesNotFoundError) {
          res.status(404).json({ error: err.customMessage });
      } else if (err instanceof UserNotAuthorizedError) {
          res.status(403).json({ error: err.customMessage });
      } else {
          res.status(500).json({ error: 'Error while getting preferences' });
      }
  }
});

/**
 * API endpoint for deleting a preference
 */
app.delete('/api/preferences/:id', isLoggedIn, async (req, res) => {
  try {
    const result = await proposalsDao.deletePreference(req.user.id, req.params.id);
    res.json(result)
  } catch (err) {
    if (err instanceof UserNotAuthorizedError) {
      res.status(403).json({ error: err.customMessage });
    } else if(err instanceof NotInRightPhaseError) {
      res.status(403).json({ error: err.customMessage });
    } else {
      res.status(500).json({ error: 'Error while deleting preference.' });
    }
    
  }
});


/**
 * API endpoint for approving proposals based on the budget
 */
app.post('/api/proposals/approved', async (req, res) => {
  try{
    const result = await proposalsDao.getProposalsApproved();
    res.json(result);
  } catch(err) {
      res.status(500).json({ error: 'Error while approving proposals' });
  
  }
})


/**
 * API endpoint for proposals not approved
 */
app.post('/api/proposals/not-approved', async (req, res) => {
  try{
    const result = await proposalsDao.getProposalsNotApproved();
    res.json(result);
  } catch(err) {
    if(err instanceof NotInRightPhaseError) {
      res.status(403).json({error: err.customMessage});
    } else {
      res.status(500).json({ error: 'Error while approving proposals' });

    }
  
  }
})




/**
 * Budget APIs
 */

/**
 * API endpoint for inserting a budget
 */
app.post('/api/budget', isLoggedIn, async (req, res) => {
  try {
    console.log(req.user.role);
      if (req.user.role !== 'Admin') {
          return res.status(401).json({ error: err.customMessage });
      }

      const amount = req.body.amount;
      const result = await budgetDao.insertBudget(amount);
      res.json(result);
  } catch (err) {
      if (err instanceof BudgetAlreadyExistError) {
        res.status(409).json({ error: err.customMessage });
      } else {
        res.status(500).json({ error: 'Error while inserting budget' });
      }
      
      
  }
});

/**
 * API endpoint for getting the current budget
 */
app.get('/api/budget', isLoggedIn, async (req, res) => {
  try {
      const result = await budgetDao.getCurrentBudget();
      res.json(result);
  } catch (err) {
    if(err instanceof BudgetNotFoundError) {
      res.status(404).json({error: err.customMessage});
    
    } else {
        res.status(500).json({ error: 'Error while getting budget' });

    }
  }
});

/**
 * API endpoint for setting the phase
 */
app.put('/api/budget/phase', isLoggedIn, async (req, res) => {
  try {
    

    const result = await budgetDao.setPhase();
    res.json(result);

  } catch(err) {
        res.status(500).json({ error: 'Error while setting phase' });
      
  }
});

/**
* API endpoint for getting the current phase 
*/
app.get('/api/budget/phase', async (req, res) => {
  try {
    const result = await budgetDao.getCurrentPhase();
    res.json(result);
  
  } catch(err) {
      res.status(500).json({ error: 'Error while getting phase' });
    
  }
})

/**
 * API endpoint for inserting a phase
 */
app.post('/api/budget/phase', async (req, res) => {
  try {
    const result = await budgetDao.insertPhase();
    res.json(result);
  } catch(err) {
    res.status(500).json({ error: 'Error while setting phase' });
  }
})
  
  
   
  



/**
 * API endpoint for resetting the database (except for users)
 */
app.post('/api/reset-database', isLoggedIn, async (req, res) => {
  try {
      if (req.user.role !== Role.ADMIN) {
          return res.status(401).json({ error: customMessage });
      }
      const result = await resetAllDao.resetAll();

      res.json(result);
  } catch (err) {
      console.error('Error resetting database:', err);
      res.status(500).json({ success: false, error: 'Failed to reset database' });
  }
});




app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});