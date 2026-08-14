using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

using System.Threading.Tasks;

namespace ProEventos.Application.Dtos
{
    public class EventoDto
    {
            public int Id { get; set; }
            [Required(ErrorMessage = "O campo {0} é obrigatório.")]
            [StringLength(100, MinimumLength = 3, ErrorMessage = "O campo {0} deve ter entre {2} e {1} caracteres.")]
                

                public string Local { get; set; }


                [Required(ErrorMessage = "O campo {0} é obrigatório.")]
                [RegularExpression(
                    @"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$",
                    ErrorMessage = "A {0} deve estar em um formato ISO válido (ex: 2026-08-10T20:00:00)."
                )]
                public string DataEvento { get; set; }    
                public string Tema { get; set; }

        [Range(1, 120000, ErrorMessage = "O campo {0} deve estar entre {1} e {2}."), Display(Name = "Quantidade de Pessoas")]
        public int QtdPessoas { get; set; }

        [RegularExpression(@".*\.(gif|jpe?g|bmp|png)$", ErrorMessage = "Não é uma imagem válida. (gif, jpg, jpeg, bmp ou png)")]
        public string ImagemURL { get; set; }

        [Required(ErrorMessage = "O campo {0} é obrigatório."),
         Phone(ErrorMessage = "O campo {0} está em formato inválido."), Display(Name = "Telefone")]
        public string Telefone { get; set; }

        [Required(ErrorMessage = "O campo {0} é obrigatório."),
         EmailAddress(ErrorMessage = "O campo {0} está em formato inválido."), Display(Name = "E-mail")]
        public string Email { get; set; }

        public IEnumerable<LoteDto> Lotes { get; set; }
        public IEnumerable<RedeSocialDto> RedesSociais { get; set; }
        public IEnumerable<PalestranteDto> Palestrantes { get; set; }
    }
}