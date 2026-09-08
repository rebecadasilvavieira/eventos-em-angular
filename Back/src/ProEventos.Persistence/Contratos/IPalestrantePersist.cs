using System.Threading.Tasks;
using System.Collections.Generic;
using ProEventos.Domain;
using ProEventos.Persistence.Models;

namespace ProEventos.Persistence.Contratos
{
    public interface IPalestrantePersist : IGeralPersist
    {
        Task<Dictionary<int, int>> ContarEventosCriadosAsync(int[] userIds);
        Task<PageList<Palestrante>> GetAllPalestrantesAsync(PageParams pageParams, bool includeEventos = false);
        Task<Palestrante> GetPalestranteByUserIdAsync(int userId, bool includeEventos);
    }
}
