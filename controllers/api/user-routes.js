const router = require('express').Router;
const { User, Post, Comment, Vote } = require('../../models');

// * /api/users route

// GET all users
router.get('/', (req, res) => {
    User.findAll({
        attributes: { exclude: ['password'] }
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// GET one user with associated ID
router.get('/:id', (req, res) => {
    User.findOne({
      attributes: { exclude: ["password"] },
      where: { id: req.params.id },
      include: [
        {
          model: Post,
          attributes: ["id", "title", "content", "created_at"],
        },
        {
          model: Comment,
          attributes: ["id", "comment_text", "created_at"],
          include: {
            model: Post,
            attributes: ["title"],
          },
        },
        {
          model: Post,
          attributes: ["title"],
          through: Vote,
          as: "voted_posts",
        },
      ],
    })
    .then(dbUserData => {
        if (!dbUserData) {
            res.status(404).json({ message: 'No user found with this id' });
            return;
        }
        res.json(dbUserData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// CREATE a user
router.post('/', (req, res) => {
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
    .then(dbUserData => {
        req.session.save(() => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;

            res.json(dbUserData);
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// UPDATE a user
router.put('/:id', (req, res) => {
    // Only update what is passed through
    User.update(req.body, {
        individualHooks: true,
        where: { id: req.params.id }
    })
    .then(dbUserData => {
        if (!dbUserData) {
            res.status(404).json({ message: 'No user found with this ID' });
            return;
        }
        res.json(dbUserData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// DELETE a user by its ID
router.delete('/:id', (req, res) => {
    User.destroy({
        where: { id: req.params.id }
    })
    .then(dbUserData => {
        if (!dbUserData) {
            res.status(404).json({ message: 'No user found with this ID' });
            return;
        }
        res.json(dbUserData);
    });
});