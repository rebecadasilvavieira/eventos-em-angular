using System.Collections.Generic;
using System.Threading.Tasks;
using ProEventos.Domain.Identity;

namespace ProEventos.Persistence.Contratos
{
    public interface IUserPersist : IGeralPersist
    {
        Task RemoverVinculosComoPalestranteAsync(int userId);
        Task<(int Criados, int ComoPalestrante)> ContarEventosAsync(int userId);
        Task<IEnumerable<User>> GetUsersAsync();

        Task<User> GetUserByIdAsync(int id);

        Task<User> GetUserByUserNameAsync(string userName);
    }
}
