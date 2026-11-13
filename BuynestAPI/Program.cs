

using BuynestAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// CORS - React frontend connection
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:5176",
            "http://localhost:5177"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddAuthorization();

// JWT Authentication
builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            builder.Configuration["Jwt:Key"]!))
            };
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter your JWT token"
        });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] = []
        });
});

// PostgreSQL Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity + Roles + Token Providers
builder.Services
    .AddIdentityCore<BuynestAPI.Models.ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddDefaultTokenProviders()
    .AddEntityFrameworkStores<AppDbContext>();

var app = builder.Build();

// CORS
app.UseCors("ReactFrontend");

// Create Admin role and assign configured user
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    var roleManager =
        services.GetRequiredService<RoleManager<IdentityRole>>();

    var userManager =
        services.GetRequiredService<UserManager<BuynestAPI.Models.ApplicationUser>>();

    // Create Admin role if it does not exist
    if (!await roleManager.RoleExistsAsync("Admin"))
    {
        var createRoleResult =
            await roleManager.CreateAsync(new IdentityRole("Admin"));

        if (createRoleResult.Succeeded)
        {
            Console.WriteLine("ADMIN ROLE CREATED SUCCESSFULLY");
        }
        else
        {
            foreach (var error in createRoleResult.Errors)
            {
                Console.WriteLine($"ROLE ERROR: {error.Description}");
            }
        }
    }
    else
    {
        Console.WriteLine("ADMIN ROLE ALREADY EXISTS");
    }

    // Find configured Admin user
    var adminEmail = builder.Configuration["AdminUser:Email"];

    if (string.IsNullOrWhiteSpace(adminEmail))
    {
        Console.WriteLine("ADMIN EMAIL NOT CONFIGURED");
    }
    else
    {
        var adminUser =
            await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            Console.WriteLine("ADMIN USER NOT FOUND");
        }
        else
        {
            // Assign Admin role if not already assigned
            if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
            {
                var roleResult =
                    await userManager.AddToRoleAsync(adminUser, "Admin");

                if (roleResult.Succeeded)
                {
                    Console.WriteLine("ADMIN ROLE ASSIGNED SUCCESSFULLY");
                }
                else
                {
                    foreach (var error in roleResult.Errors)
                    {
                        Console.WriteLine(
                            $"ADMIN ROLE ERROR: {error.Description}");
                    }
                }
            }
            else
            {
                Console.WriteLine("USER IS ALREADY AN ADMIN");
            }
        }
    }
}

// Swagger UI
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseSwagger();
app.UseSwaggerUI();

// Authentication and Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
