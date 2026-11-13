
using BuynestAPI.DTOs;
using BuynestAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BuynestAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _configuration = configuration;
            _roleManager = roleManager;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var user = new ApplicationUser
            {
                FullName = request.FullName,
                UserName = request.Email,
                Email = request.Email
            };

            var result = await _userManager.CreateAsync(
                user,
                request.Password
            );

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Registration failed",
                    errors = result.Errors
                });
            }

            return Ok(new
            {
                message = "Registration successful"
            });
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                fullName = user.FullName,
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                address = user.Address
            });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(ProfileUpdateRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (request.FullName != null)
                user.FullName = request.FullName;

            if (request.PhoneNumber != null)
                user.PhoneNumber = request.PhoneNumber;

            if (request.Address != null)
                user.Address = request.Address;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors });
            }

            return Ok(new
            {
                message = "Profile updated successfully",
                fullName = user.FullName,
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                address = user.Address
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email"
                });
            }

            var isPasswordValid = await _userManager.CheckPasswordAsync(
                user,
                request.Password
            );

            if (!isPasswordValid)
            {
                return Unauthorized(new
                {
                    message = "Invalid password"
                });
            }

            var jwtKey = _configuration["Jwt:Key"]!;

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!)
            };

            foreach (var role in roles)
            {
                claims.Add(
                    new Claim(ClaimTypes.Role, role)
                );
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: credentials
            );

            var generatedToken =
                new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                message = "Login successful",
                token = generatedToken
            });
        }
    }
}
