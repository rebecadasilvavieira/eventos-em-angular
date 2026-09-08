using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProEventos.Domain.Identity;
using ProEventos.Persistence.Contextos;
using ProEventos.Persistence.Contratos;

        namespace ProEventos.Persistence
        {
            public class UserPersist : GeralPersist, IUserPersist
            {
                    private readonly ProEventosContext _context;
                public UserPersist(ProEventosContext context) : base(context)
                {
                    _context =context;
                }
                public async Task<IEnumerable<User>> GetUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> GetUserByUserNameAsync(string username)
        {
            return await _context.Users
                .SingleOrDefaultAsync(user => user.UserName.ToLower() == username.ToLower());
        }
        public async Task RemoverVinculosComoPalestranteAsync(int userId)
        {
            var vinculos = await _context.PalestrantesEventos
                .Where(pe => pe.Palestrante.UserId == userId).ToArrayAsync();
            _context.PalestrantesEventos.RemoveRange(vinculos);
        }
        public async Task<(int Criados, int ComoPalestrante)> ContarEventosAsync(int userId)
        {
            var criados = await _context.Eventos.CountAsync(e => e.UserId == userId);
            var participacoes = await _context.PalestrantesEventos.CountAsync(pe =>
                pe.Palestrante.UserId == userId &&
                pe.Palestrante.User.Funcao == ProEventos.Domain.Enum.Funcao.Palestrante);
            return (criados, participacoes);
        }
        }
        }
