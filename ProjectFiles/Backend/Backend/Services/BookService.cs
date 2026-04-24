using Backend.DbContexts;
using Backend.Models;
using System;

namespace Backend.Services
{
    public class BookService
    {
        private readonly UsersDbContext _context;

        public BookService(UsersDbContext context)
        {
            _context = context;
        }

        public List<Book> GetAll()
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);

            foreach (var room in _context.Rooms)
            {
                bool isActive = _context.Books
                    .Any(b => b.RoomId == room.Id && b.DateEnd >= today);

                room.IsOccupied = isActive;
            }

            _context.SaveChanges();

            return _context.Books.ToList(); 
        }
        public Book? GetBookById(int id)
        {
            return _context.Books.FirstOrDefault(u => u.Id == id);
        }
        public List<Book> GetBooksByUserId(int userId)
        {
            return _context.Books
                .Where(b => b.UserId == userId)
                .ToList();
        }
        public Room? GetRoomById(int id)
        {
            return _context.Rooms.FirstOrDefault(u => u.Id == id);
        }

        public Book Add(BookDTO bookDTO, int userId) 
        {
            Room? foundRoom = GetRoomById(bookDTO.RoomId);
            if (foundRoom == null)
                return null;

            DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);

            if (bookDTO.DateStart < today || bookDTO.DateEnd < today || bookDTO.DateStart > bookDTO.DateEnd)
                return null;

            int dayDist = bookDTO.DateEnd.DayNumber - bookDTO.DateStart.DayNumber;
            if (dayDist < 1) dayDist = 1; 

            var book = new Book
            {
                UserId = userId,
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
