using Backend.DbContexts;
using Backend.Models;

namespace Backend.Services
{
    public class RoomService
    {
        private readonly UsersDbContext _context;

        public RoomService(UsersDbContext context)
        {
            _context = context;
        }

        public List<Room> GetAll() => _context.Rooms.ToList();
        public Room? GetRoomById(int id)
        {
            return _context.Rooms.FirstOrDefault(u => u.Id == id);
        }
        public void Add(Room room)
        {
            _context.Rooms.Add(room);
            _context.SaveChanges();
        }
        public bool Delete(int id)
        {
            Room? foundRoom = GetRoomById(id);
            if (foundRoom is null)
                return false;
            _context.Rooms.Remove(foundRoom);
            _context.SaveChanges();
            return true;
        }
        public bool Update(Room room)
        {
            Room? foundRoom = GetRoomById(room.Id);
            if (foundRoom is null)
                return false;
            foundRoom.Name = room.Name;
            foundRoom.Description = room.Description;
            foundRoom.Price = room.Price;
            foundRoom.IsOccupied = room.IsOccupied;
            _context.SaveChanges();
            return true;
        }
    }
}
