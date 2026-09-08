using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProEventos.API.Extensions;
using ProEventos.Domain;
using ProEventos.Persistence.Contextos;

namespace ProEventos.API.Controllers
{
    [Authorize]
    [ProEventos.API.Helpers.EdicaoPalestrante]
    [ApiController]
    [Route("api/eventos/{eventoId:int}/palestrantes")]
    public class EventoPalestrantesController : ControllerBase
    {
        private readonly ProEventosContext _context;

        public EventoPalestrantesController(ProEventosContext context)
        {
            _context = context;
        }

        private Task<bool> PodeEditar(int eventoId)
        {
            var userId = User.GetUserId();
            return _context.Eventos.AnyAsync(e => e.Id == eventoId && e.UserId == userId);
        }

        [HttpGet]
        public async Task<IActionResult> Get(int eventoId)
        {
            if (!await PodeEditar(eventoId)) return NotFound();

            var palestrantes = await _context.Palestrantes.AsNoTracking()
                .Where(p => p.User.Funcao == ProEventos.Domain.Enum.Funcao.Palestrante)
                .OrderBy(p => p.User.PrimeiroNome).ThenBy(p => p.User.UltimoNome)
                .Select(p => new {
                    p.Id,
                    Nome = ((p.User.PrimeiroNome ?? "") + " " + (p.User.UltimoNome ?? "")).Trim() == ""
                        ? p.User.UserName
                        : ((p.User.PrimeiroNome ?? "") + " " + (p.User.UltimoNome ?? "")).Trim(),
                    Associado = p.PalestrantesEventos.Any(pe => pe.EventoId == eventoId)
                }).ToArrayAsync();
            return Ok(palestrantes);
        }

        [HttpPut("{palestranteId:int}")]
        public async Task<IActionResult> Adicionar(int eventoId, int palestranteId)
        {
            if (!await PodeEditar(eventoId)) return NotFound();
            if (!await _context.Palestrantes.AnyAsync(p => p.Id == palestranteId &&
                p.User.Funcao == ProEventos.Domain.Enum.Funcao.Palestrante))
                return NotFound(new { message = "Palestrante n?o encontrado." });

            if (await _context.PalestrantesEventos.AnyAsync(pe => pe.EventoId == eventoId && pe.PalestranteId == palestranteId))
                return NoContent();

            _context.PalestrantesEventos.Add(new PalestranteEvento {
                EventoId = eventoId, PalestranteId = palestranteId
            });
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{palestranteId:int}")]
        public async Task<IActionResult> Remover(int eventoId, int palestranteId)
        {
            if (!await PodeEditar(eventoId)) return NotFound();
            var vinculo = await _context.PalestrantesEventos
                .SingleOrDefaultAsync(pe => pe.EventoId == eventoId && pe.PalestranteId == palestranteId);
            if (vinculo == null) return NoContent();

            _context.PalestrantesEventos.Remove(vinculo);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
