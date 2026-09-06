using System;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using ProEventos.API.Controllers;
using ProEventos.Domain;
using ProEventos.Domain.Identity;
using ProEventos.Persistence.Contextos;

using var connection = new SqliteConnection("Data Source=:memory:");
await connection.OpenAsync();
var options = new DbContextOptionsBuilder<ProEventosContext>().UseSqlite(connection).Options;
using var context = new ProEventosContext(options);
await context.Database.EnsureCreatedAsync();
context.Users.AddRange(new User { Id = 1, UserName = "dono", PrimeiroNome = "Ana", UltimoNome = "Silva" }, new User { Id = 2, UserName = "outro" });
context.Eventos.AddRange(new Evento { Id = 7, UserId = 1, Tema = "Evento A" }, new Evento { Id = 9, UserId = 2, Tema = "Evento B" });
context.Palestrantes.Add(new Palestrante { Id = 3, UserId = 1, MiniCurriculo = "Teste" });
await context.SaveChangesAsync();
var controller = new EventoPalestrantesController(context) {
    ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext {
        User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "1") }, "test"))
    }}
};
void Check(bool condition, string name) { if (!condition) throw new Exception(name); Console.WriteLine("OK: " + name); }
Check(await controller.Adicionar(9, 3) is NotFoundResult, "bloqueia adicionar em evento de outro usuario");
Check(await controller.Get(9) is NotFoundResult, "bloqueia consulta de evento de outro usuario");
Check(await controller.Adicionar(7, 99) is NotFoundObjectResult, "rejeita palestrante inexistente");
Check(await controller.Adicionar(7, 3) is NoContentResult, "adiciona vinculo");
await controller.Adicionar(7, 3);
Check(await context.PalestrantesEventos.CountAsync() == 1, "adicionar novamente nao duplica");
// Um novo contexto verifica o que foi persistido no banco, sem usar entidades em memoria.
using (var consulta = new ProEventosContext(options)) {
    Check(await consulta.PalestrantesEventos.AnyAsync(pe => pe.EventoId == 7 && pe.PalestranteId == 3), "vinculo persiste ao reabrir contexto");
}
var resultado = (OkObjectResult)await controller.Get(7);
var json = JsonSerializer.Serialize(resultado.Value);
Check(json.Contains("Ana Silva") && json.Contains("\"Associado\":true"), "consulta retorna nome e associacao salva");
Check(await controller.Remover(9, 3) is NotFoundResult, "bloqueia remocao em evento de outro usuario");
await controller.Remover(7, 3);
Check(await context.PalestrantesEventos.CountAsync() == 0 && await context.Palestrantes.CountAsync() == 1, "remove apenas o vinculo e preserva o palestrante");
Console.WriteLine("9 verificacoes passaram; banco SQLite apenas em memoria.");
