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

        public Book Add(BookDTO bookDTO)
        {
            Room? foundRoom = GetRoomById(bookDTO.RoomId);
            if (foundRoom == null || foundRoom.IsOccupied || bookDTO.DateStart > bookDTO.DateEnd)
                return null;

            int dayDist = bookDTO.DateEnd.DayNumber - bookDTO.DateStart.DayNumber;

            var book = new Book
            {
                UserId = bookDTO.UserId,
                RoomId = bookDTO.RoomId,
                DateStart = bookDTO.DateStart,
                DateEnd = bookDTO.DateEnd,
                TotalPrice = foundRoom.Price * dayDist 
            };

            foundRoom.IsOccupied = true;

            _context.Books.Add(book);
            _context.SaveChanges();
            return book;
        }
        public bool Delete(int id)
        {
            Book? foundBook = GetBookById(id);
            if (foundBook is null)
                return false;
            Room? foundRoom = GetRoomById(foundBook.RoomId);

            if (foundRoom != null)
                foundRoom.IsOccupied = false;

            _context.Books.Remove(foundBook);
            _context.SaveChanges();
            return true;
        }
        public bool Update(int id, BookDTO bookDTO)
        {
            Book? foundBook = GetBookById(id);
            if (foundBook is null)
                return false;

            Room? foundRoom = GetRoomById(bookDTO.RoomId);
            if (foundRoom is null || bookDTO.DateStart > bookDTO.DateEnd)
                return false;

            foundBook.UserId = bookDTO.UserId;
            foundBook.RoomId = bookDTO.RoomId;
            foundBook.DateStart = bookDTO.DateStart;
            foundBook.DateEnd = bookDTO.DateEnd;

            int dayDist = foundBook.DateEnd.DayNumber - foundBook.DateStart.DayNumber;
            if (dayDist < 1)
                dayDist = 1;

            foundBook.TotalPrice = foundRoom.Price * dayDist;

            _context.SaveChanges();
            return true;
        }
    }
}
