using Backend.DbContexts;
using Backend.Models;

namespace Backend.Services
{
    public class UserService
    {
        private readonly UsersDbContext _context;

        public UserService(UsersDbContext context)
        {
            _context = context;
        }

        public List<User> GetAll() => _context.Users.ToList();
        public User? GetUserById(int id)
        {
            return _context.Users.FirstOrDefault(u => u.Id == id);
        }

        public void Add(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
        }
        public bool Delete(int id)
        {
            User? foundUser = GetUserById(id);
            if (foundUser is null)
                return false;
            _context.Users.Remove(foundUser);
            _context.SaveChanges();
            return true;
        }
        public bool Update(User user)
        {
            User? foundUser = GetUserById(user.Id);
            if (foundUser is null)
                return false;
            foundUser.Name = user.Name;
            foundUser.Email = user.Email;
            foundUser.Role = user.Role;
            _context.SaveChanges();
            return true;
        }


        public void RegisterUser(User user)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            _context.Users.Add(user);
            _context.SaveChanges();
        }

        public User? ValidateUser(UserLoginDTO credentials)
        {
            var user = _context.Users.FirstOrDefault(
                u => u.Email == credentials.Email);

            if (user == null)
                return null;

            if (!BCrypt.Net.BCrypt.Verify(credentials.Password, user.PasswordHash))
                return null;

            return user;
        }
    }
}
