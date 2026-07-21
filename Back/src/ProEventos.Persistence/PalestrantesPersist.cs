using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProEventos.Domain;
using ProEventos.IpalestrantePersistence.Contratos;
using ProEventos.Persistence.Contexto;
using ProEventos.Persistence.Contratos;


namespace ProEventos.Persistence
{
    public class PalestrantesPersist : IPalestrantesPersist
    {
        private readonly ProEventosContext _context;
        public PalestrantesPersist(ProEventosContext _context)
        {
            this._context = _context;
        }
        
        public async Task<Palestrantes[]> GetAllPalestrantesByNomeAsync(string Nome, bool includeEventos)
        {
              IQueryable<Palestrantes> query = _context.Palestrantes.Include(p => p.RedeSocial);
                                                       
                                                       if (includeEventos)
                                                       {
                                                           query = query.Include(p => p.PalestrantesEventos)
                                                                        .ThenInclude(pe => pe.Evento);
                                                       }

              query = query.OrderBy(p => p.Id).Where(p => p.Nome.ToLower().Contains(Nome.ToLower()));
              return await query.ToArrayAsync();                                         
        }
       

        public async Task<Palestrantes> GetPalestranteByIdAsync(int palestranteId, bool includeEventos)
        {
                  IQueryable<Palestrantes> query = _context.Palestrantes.Include(p => p.RedeSocial);
                                                       
                                                       if (includeEventos)
                                                       {
                                                           query = query.Include(p => p.PalestrantesEventos)
                                                                        .ThenInclude(pe => pe.Evento);
                                                       }

              query = query.OrderBy(p => p.Id).Where(p => p.Id == palestranteId);
              return await query.FirstOrDefaultAsync();                                         
        }
       
        }

    public interface IPalestrantesPersist
    {
    }
}
