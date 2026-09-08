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
using AutoMapper;
using ProEventos.Application;
using ProEventos.Application.Helpers;
using ProEventos.Persistence;
using ProEventos.Persistence.Models;
using System.Linq;
using ProEventos.Application.Dtos;
using ProEventos.Domain.Enum;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using ProEventos.API.Helpers;
using System.Collections.Generic;
using System.Threading.Tasks;

using var connection = new SqliteConnection("Data Source=:memory:");
await connection.OpenAsync();
var options = new DbContextOptionsBuilder<ProEventosContext>().UseSqlite(connection).Options;
using var context = new ProEventosContext(options);
await context.Database.EnsureCreatedAsync();
context.Users.AddRange(new User { Id = 1, UserName = "dono", PrimeiroNome = "Ana", UltimoNome = "Silva", Funcao = Funcao.Palestrante }, new User { Id = 2, UserName = "outro" });
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
var mapper = new MapperConfiguration(cfg => cfg.AddProfile<ProEventosProfile>()).CreateMapper();
var service = new PalestranteService(new PalestrantePersist(context), mapper);
var cards = await service.GetAllPalestrantesAsync(1, new PageParams(), true);
Check(cards.Single().TotalEventosCriados == 1, "conta somente eventos criados pelo palestrante");
Check(cards.Single().TotalEventosComoPalestrante == 1, "conta o vinculo salvo no cartao");
Check(await controller.Remover(9, 3) is NotFoundResult, "bloqueia remocao em evento de outro usuario");
await controller.Remover(7, 3);
Check(await context.PalestrantesEventos.CountAsync() == 0 && await context.Palestrantes.CountAsync() == 1, "remove apenas o vinculo e preserva o palestrante");
cards = await service.GetAllPalestrantesAsync(1, new PageParams(), true);
Check(cards.Single().TotalEventosCriados == 1 && cards.Single().TotalEventosComoPalestrante == 0,
    "remover vinculo atualiza participacoes e preserva eventos criados");
await controller.Adicionar(7, 3);
context.PalestrantesEventos.Add(new PalestranteEvento { EventoId = 9, PalestranteId = 3 });
await context.SaveChangesAsync();
var account = new AccountService(null, null, mapper, new UserPersist(context));
var perfil = mapper.Map<UserUpdateDto>(await context.Users.FindAsync(1));
var resumo = await account.GetUserByUserNameAsync("dono");
Check(resumo.TotalEventosCriados == 1 && resumo.TotalEventosComoPalestrante == 2,
    "perfil retorna eventos criados e participacoes reais");
perfil.Funcao = "Participante";
await account.UpdateAccount(perfil);
Check(await context.PalestrantesEventos.CountAsync() == 0, "participante perde vinculos em todos os eventos");
resumo = await account.GetUserByUserNameAsync("dono");
Check(resumo.TotalEventosCriados == 1 && resumo.TotalEventosComoPalestrante == 0,
    "contadores do perfil atualizam apos mudar para participante");
Check(await context.Eventos.CountAsync() == 2, "mudanca de funcao preserva eventos criados");
cards = await service.GetAllPalestrantesAsync(1, new PageParams { Term = "Ana" }, true);
Check(cards.Count == 0, "participante nao aparece na busca de palestrantes pelo nome");
cards = await service.GetAllPalestrantesAsync(1, new PageParams(), true);
Check(cards.Count == 0, "participante nao aparece na lista sem filtro");
resultado = (OkObjectResult)await controller.Get(7);
Check(JsonSerializer.Serialize(resultado.Value) == "[]", "participante sai da selecao de palestrantes do evento");
Check(await controller.Adicionar(7, 3) is NotFoundObjectResult, "API impede vincular participante como palestrante");
var provider = new ContextServiceProvider(context);
async Task<bool> PodeExecutar(string method, int? eventoId = null)
{
    var httpContext = new DefaultHttpContext { RequestServices = provider,
        User = controller.User };
    httpContext.Request.Method = method;
    var routeData = new RouteData();
    if (eventoId.HasValue) routeData.Values["eventoId"] = eventoId.Value;
    var action = new ActionContext(httpContext, routeData, new ActionDescriptor());
    var filters = new List<IFilterMetadata>();
    var executing = new ActionExecutingContext(action, filters, new Dictionary<string, object>(), controller);
    var executou = false;
    await new EdicaoPalestranteAttribute().OnActionExecutionAsync(executing, () => {
        executou = true;
        return Task.FromResult(new ActionExecutedContext(action, filters, controller));
    });
    return executou;
}
Check(!await PodeExecutar("POST"), "participante nao pode criar evento");
Check(!await PodeExecutar("PUT", 7) && !await PodeExecutar("DELETE", 7),
    "mudanca de funcao bloqueia escrita com a mesma identidade autenticada");
Check(await PodeExecutar("GET", 7), "participante mantem acesso de leitura");
var eventosPersist = new EventoPersist(context);
Check(await eventosPersist.GetEventoByIdAsync(1, 9) != null,
    "participante pode consultar detalhes de evento de outro organizador");
perfil.Funcao = "Palestrante";
await account.UpdateAccount(perfil);
cards = await service.GetAllPalestrantesAsync(1, new PageParams(), true);
Check(cards.Count == 1 && cards.Single().TotalEventosComoPalestrante == 0,
    "retornar a palestrante preserva perfil sem restaurar vinculos removidos");
Check(await PodeExecutar("PUT", 7) && !await PodeExecutar("PUT", 9),
    "palestrante pode editar apenas eventos proprios");
var eventosContaSemFuncao = await eventosPersist.GetAllEventosAsync(2, new PageParams());
Check(eventosContaSemFuncao.Count == 2, "conta antiga sem funcao enxerga eventos de outros usuarios");
Check(await eventosPersist.GetEventoByIdAsync(2, 7) != null, "conta sem funcao pode consultar os detalhes");
context.Users.Add(new User { Id = 4, UserName = "Lucas.Almeida", NormalizedUserName = "LUCAS.ALMEIDA" });
await context.SaveChangesAsync();
var perfilMaiusculas = await account.GetUserByUserNameAsync("lucas.almeida");
Check(perfilMaiusculas != null && perfilMaiusculas.UserName == "Lucas.Almeida",
    "perfil e encontrado independentemente das maiusculas do login");
// Reproduz o schema legado, anterior ao organizador obrigatorio, em outro banco em memoria.
using (var legado = new SqliteConnection("Data Source=:memory:"))
{
    await legado.OpenAsync();
    var optionsLegado = new DbContextOptionsBuilder<ProEventosContext>().UseSqlite(legado).Options;
    using var dbLegado = new ProEventosContext(optionsLegado);
    await dbLegado.Database.EnsureCreatedAsync();
    await dbLegado.Database.ExecuteSqlRawAsync("PRAGMA foreign_keys = OFF;");
    await dbLegado.Database.ExecuteSqlRawAsync("DROP TABLE Eventos;");
    await dbLegado.Database.ExecuteSqlRawAsync(@"CREATE TABLE Eventos (
        Id INTEGER PRIMARY KEY, UserId INTEGER NULL, Tema TEXT, Local TEXT, DataEvento TEXT,
        QtdPessoas INTEGER NOT NULL, ImagemURL TEXT, Telefone TEXT, Email TEXT);");
    await dbLegado.Database.ExecuteSqlRawAsync("INSERT INTO Eventos (Id, UserId, Tema, QtdPessoas) VALUES (1, NULL, 'Legado', 10), (2, 4, 'Atual', 10);");
    dbLegado.Users.Add(new User { Id = 4, UserName = "visitante", Funcao = Funcao.Participante });
    await dbLegado.SaveChangesAsync();
    var persistLegado = new EventoPersist(dbLegado);
    var eventosValidos = await persistLegado.GetAllEventosAsync(4, new PageParams(), true);
    Check(eventosValidos.Count == 1 && eventosValidos.Single().Id == 2,
        "evento legado sem organizador nao quebra o dashboard do participante");
    Check(await persistLegado.GetEventoByIdAsync(4, 1, true) == null,
        "consulta direta a evento sem organizador nao gera erro de banco");
}
Console.WriteLine("31 verificacoes passaram; banco SQLite apenas em memoria.");

sealed class ContextServiceProvider : IServiceProvider
{
    private readonly ProEventosContext context;
    public ContextServiceProvider(ProEventosContext context) { this.context = context; }
    public object GetService(Type type) => type == typeof(ProEventosContext) ? context : null;
}
