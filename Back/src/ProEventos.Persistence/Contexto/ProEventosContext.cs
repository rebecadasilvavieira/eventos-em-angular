using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProEventos.Domain;
using ProEventos.Persistence.Contexto;


namespace ProEventos.Persistence.Contexto
{
    public class ProEventosContext : DbContext
    {

        public ProEventosContext(DbContextOptions<ProEventosContext> options) : base(options) { }
        public DbSet<Evento> Eventos { get; set; }
        public DbSet<Lote> Lotes { get; set; }
        public DbSet<Palestrantes> Palestrantes { get; set; }
        public DbSet<PalestrantesEvento> PalestrantesEventos { get; set; }
        public DbSet<RedeSocial> RedesSociais { get; set; }
   
        

       protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<PalestrantesEvento>()
        .HasKey(pe => new { pe.EventoId, pe.PalestranteId });

   modelBuilder.Entity<Evento>()
        .HasMany(e => e.RedeSocial)
        .WithOne(rs => rs.Evento)
        .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<PalestrantesEvento>()
        .HasOne(pe => pe.Evento)
        .WithMany(e => e.PalestrantesEventos)
        .HasForeignKey(pe => pe.EventoId);

    modelBuilder.Entity<PalestrantesEvento>()
        .HasOne(pe => pe.Palestrante)
        .WithMany(p => p.PalestrantesEventos)
        .HasForeignKey(pe => pe.PalestranteId);
}

    }

}