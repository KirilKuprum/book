using Backend.Services;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly RoomService _roomService;
        public RoomsController(RoomService roomService)
        {
            _roomService = roomService;
        }
        [Authorize]
        [HttpGet]
        public ActionResult<List<Room>> GetRooms()
        {
            return Ok(_roomService.GetAll());
        }
        [Authorize]
        [HttpGet("{id}")]
        public ActionResult<Room> GetRoomById(int id)
        {
            Room? room = _roomService.GetRoomById(id);
            if (room is null)
                return NotFound("Кімнату не знайдено");
            return Ok(room);
        }
        [Authorize(Roles = "Admin,Moderator")]
        [HttpDelete("{id}")]
        public ActionResult DeleteRoom(int id)
        {
            if (_roomService.Delete(id))
                return Ok();
            else
                return NotFound("Кімнату не знайдено");

        }
        [Authorize(Roles = "Admin,Moderator")]
        [HttpPost]
        public ActionResult AddRoom([FromBody] RoomDTO roomDTO)
        {
            _roomService.Add(roomDTO);
            return Ok();
        }
        [Authorize(Roles = "Admin,Moderator")]
        [HttpPut("{id}")]
        public ActionResult PutRoom(int id, [FromBody] RoomDTO roomDTO)
        {
            if (_roomService.Update(id, roomDTO))
                return Ok("Кімнату оновлено");
            else
                return NotFound("Кімнату не знайдено");
        }
        
    }
}