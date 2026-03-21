namespace Backend.Models
{
    public class BookDTO
    {
        public int UserId { get; set; }
        public int RoomId { get; set; }
        public DateOnly DateStart { get; set; }
        public DateOnly DateEnd { get; set; }
    }
}