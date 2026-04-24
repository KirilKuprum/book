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
        public List<UserDTO> GetAll() => _context.Users
            .Select(user => new UserDTO
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            }).ToList();

        public User? GetUserById(int id)
        {
            return _context.Users.FirstOrDefault(u => u.Id == id);
        }
        public bool MakeAdmin(int id)
        {
            var user = GetUserById(id);
            if (user == null) return false;

            user.Role = "Admin";
            _context.SaveChanges();
            return true;
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
        public bool Update(UserDTO userDTO)
        {
            User? foundUser = GetUserById(userDTO.Id);
            if (foundUser is null)
                return false;
            foundUser.Name = userDTO.Name;
            foundUser.Email = userDTO.Email;
            foundUser.Role = userDTO.Role;
            _context.SaveChanges();
            return true;
        }


        public User RegisterUser(UserRegisterDTO userRegisterDTO)
        {
            var user = new User
            {
                Name = userRegisterDTO.Name,
                Email = userRegisterDTO.Email,
                Role = "User", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userRegisterDTO.Password) 
            };
            _context.Users.Add(user);
            _context.SaveChanges();

            return user;
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
