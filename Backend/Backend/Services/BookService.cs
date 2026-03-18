using Backend.DbContexts;
using Backend.Models;

namespace Backend.Services
{
    public class BookService
    {
        private readonly UsersDbContext _context;

        public BookService(UsersDbContext context)
        {
            _context = context;
        }

        public List<Book> GetAll() => _context.Books.ToList();
        public Book? GetBookById(int id)
        {
            return _context.Books.FirstOrDefault(u => u.Id == id);
        }

        public Room? GetRoomById(int id)
        {
            return _context.Rooms.FirstOrDefault(u => u.Id == id);
        }

        public Book Add(Book book)
        {
            Room? foundRoom = GetRoomById(book.RoomId);  
            if(book.DateStart > book.DateEnd)
                return null;

            int dayDist = book.DateEnd.DayNumber - book.DateStart.DayNumber;
            book.TotalPrice = foundRoom.Price * dayDist;

            if (foundRoom.IsOccupied)
                return null;

            foundRoom.IsOccupied = true;

            _context.Books.Add(book);
            _context.SaveChanges();
            return book;
        }
        public bool Delete(int id)
        {
            Book? foundBook = GetBookById(id);
            Room? foundRoom = GetRoomById(foundBook.RoomId);

            if (foundBook is null)
                return false;
            if (foundRoom is null)
                return false;

            foundRoom.IsOccupied = false;
            _context.Books.Remove(foundBook);
            _context.SaveChanges();
            return true;
        }
        public bool Update(Book book)
        {
            Book? foundBook = GetBookById(book.Id);
            if (foundBook is null)
                return false;

            Room? foundRoom = GetRoomById(book.RoomId);
            if (foundRoom is null)
                return false;

            if (book.DateStart > book.DateEnd) 
                return false;

            foundBook.UserId = book.UserId;
            foundBook.RoomId = book.RoomId;
            foundBook.DateStart = book.DateStart;
            foundBook.DateEnd = book.DateEnd;

            int dayDist = foundBook.DateEnd.DayNumber - foundBook.DateStart.DayNumber;
            if (dayDist < 1)
                dayDist = 1;

            foundBook.TotalPrice = foundRoom.Price * dayDist;

            _context.SaveChanges();
            return true;
        }
    }
}
