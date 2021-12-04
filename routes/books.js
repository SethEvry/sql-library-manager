var express = require("express");
var router = express.Router();
const Book = require("../models").Book;
const { Op } = require("sequelize");

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  };
}
/* Middleware to set default page, change it into an int
*   and sets page to one if text is inserted for example: /books?page=potato
*/
router.use("/", (req, res, next) => {
  const page = parseInt(req.query.page);
  if (!page) {
    req.query.page = 1;
  } else {
    req.query.page = page;
  }
  next();
});

/* Shows full list of books */
router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const search = req.query.search;
    const perPage = 15;
    let bookShelf = [];
    if (search) {
      bookShelf = await Book.findAll({
        where: {
          [Op.or]: {
            title: { [Op.like]: `%${search}%` },
            author: { [Op.like]: `%${search}%` },
            genre: { [Op.like]: `%${search}%` },
            year: { [Op.like]: `%${search}%` },
          },
        },
      });
    } else {
      bookShelf = await Book.findAll();
    }
    const pages = Math.ceil(bookShelf.length / perPage);
    const page = req.query.page;
    //Makes sure page is within range
    if (page > pages) {
      const err = new Error();
      err.status = 404;
      next(err);
    }
    const books = bookShelf.slice((page - 1) * 15, perPage * page);
    books.pages = pages;
    books.currentPage = page;
    res.render("index", { books, title: "Books" });
  })
);

/*  Show the create new book form */
router.get(
  "/new",
  asyncHandler(async (req, res) => {
    res.render("new-book", { book: {}, title: "New Book" });
  })
);
/* Post a new book to db */
router.post(
  "/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/");
    } catch (err) {
      if (err.name === "SequelizeValidationError") {
        book = await Book.build(req.body); 
        res.render("new-book", { book, errors: err.errors, title: "New Book" });
      } else {
        throw err;
      }
    }
  })
);

/* Shows book detail form */
router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("update-book", { book, title: "Update Book" });
    } else {
      const err = new Error();
      err.status = 404;
      next(err);
    }
  })
);

/* Updates book info in the database */
router.post(
  "/:id",
  asyncHandler(async (req, res, next) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/");
      } else {
        const err = new Error();
        err.status = 404;
        next(err);
      }
    } catch (err) {
      if (err.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render("update-book", {
          book,
          errors: err.errors,
          title: "Update Book",
        });
      } else {
        throw err;
      }
    }
  })
);

/* Deletes a book */
router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/");
    } else {
      const err = new Error();
      err.status = 404;
      next(err);
    }
  })
);

module.exports = router;
