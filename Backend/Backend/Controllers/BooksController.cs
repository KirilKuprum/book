using Backend.Services;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly BookService _bookService;
        public BooksController(BookService bookService)
        {
            _bookService = bookService;
        }
        [Authorize(Roles = "Admin,Moderator")]
        [HttpGet]
        public ActionResult<List<Book>> GetBooks()
        {
            return Ok(_bookService.GetAll());
        }
        [Authorize(Roles = "Admin,Moderator")]
        [HttpGet("{id}")]
        public ActionResult<Book> GetBookById(int id)
        {
            Book? book = _bookService.GetBookById(id);
            if (book is null)
                return NotFound("Букування не знайдено");
            return Ok(book);
        }
        [Authorize(Roles = "Admin,Moderator")]
        [HttpDelete("{id}")]
        public ActionResult DeleteBook(int id)
        {
            if (_bookService.Delete(id))
                return Ok();
            else
                return NotFound("Кімнату не знайдено");

        }
        [Authorize]
        [HttpPost]
        public ActionResult AddBook([FromBody] BookDTO bookDTO)
        {
            _bookService.Add(bookDTO);
            return Ok();
        }
        [Authorize(Roles = "Admin,Moderator")]
        [HttpPut("{id}")]
        public ActionResult PutBook(int id, [FromBody] BookDTO bookDTO)
        {
            if (_bookService.Update(id, bookDTO))
                return Ok("Букування оновлено");
            else
                return BadRequest("Букування не знайдено");

        }

    }
}