using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace UsersAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly TokenService _tokenService;
        public UsersController(UserService userService, TokenService tokenService)
        {
            _userService = userService;
            _tokenService = tokenService;
        }

        [HttpGet]
        public ActionResult<List<UserDTO>> GetUsers()
        {
            return Ok(_userService.GetAll());
        }

        [Authorize]
        [HttpGet("me")]
        public ActionResult GetMe()
        {
            string? nameIdentifier = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int id = Convert.ToInt32(nameIdentifier);

            return Ok(_userService.GetUserById(id));
        }

        [HttpPost("register")]
        public ActionResult RegisterUser([FromBody] UserRegisterDTO userRegisterDTO)
        {
            _userService.RegisterUser(userRegisterDTO);
            return Ok();
        }

        [HttpPost("login")]
        public ActionResult LoginUser([FromBody] UserLoginDTO credentials)
        {
            var user = _userService.ValidateUser(credentials);
            if (user == null)
                return Unauthorized();
            var token = _tokenService.GenerateToken(user);
            return Ok(token);
        }
    }
}
