using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProEventos.Domain
{
    public class PalestrantesEvento
    {
        public int PalestranteId { get; set; }
        public Palestrantes Palestrante { get; set; }   
        public int EventoId { get; set; }
        public Evento Evento { get; set; }
    }
}