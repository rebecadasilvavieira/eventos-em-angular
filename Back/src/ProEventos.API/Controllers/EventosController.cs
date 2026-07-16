using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProEventos.API.Models;

namespace ProEventos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventosController : ControllerBase
    {

        private readonly ILogger<EventosController> _logger;

public IEnumerable<Evento> _eventos = new Evento[]
        {
            new Evento(){
            EventoId = 1,
            Tema = "Angular e .NET 5",
            Local = "Belo Horizonte", 
            Lote = "1º Lote",
            QtdPessoas = 250,
            DataEvento = DateTime.Now.AddDays(2).ToString("dd/MM/yyyy"),
            ImagemURL = "url-de-belo-horizonte"
        },
         new Evento(){
            EventoId = 2,
            Tema = "ASP.NET Core e React",
            Local = "São Paulo",
            Lote = "2º Lote",
            QtdPessoas = 300,
            DataEvento = DateTime.Now.AddDays(3).ToString("dd/MM/yyyy"),
            ImagemURL = "url-de-saopaulo"
            }
    };
        public EventosController()
        {
            
        }
        
        [HttpGet]
        public IEnumerable<Evento> Get()
        {
        return _eventos;
           
        }

     [HttpGet ("{id}")]
        public IEnumerable<Evento> GetbyId(int id)
        {
        return _eventos.Where(e => e.EventoId == id);
           
        }




        [HttpPost]
        public string Post()
        {
            return "post";
        }

        [HttpPut("{id}")]
        public string Put(int id)
        {
            return "put";
        }

    }
}
