using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ProEventos.API.Extensions;
using ProEventos.Domain.Enum;
using ProEventos.Persistence.Contextos;

namespace ProEventos.API.Helpers
{
    [AttributeUsage(AttributeTargets.Class)]
    public class EdicaoPalestranteAttribute : Attribute, IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var method = context.HttpContext.Request.Method;
            if (method == "GET" || method == "HEAD") { await next(); return; }
            var db = context.HttpContext.RequestServices.GetRequiredService<ProEventosContext>();
            var userId = context.HttpContext.User.GetUserId();
            if (!await db.Users.AnyAsync(u => u.Id == userId && u.Funcao == Funcao.Palestrante))
            {
                context.Result = new ForbidResult();
                return;
            }
            var route = context.RouteData.Values;
            var eventoId = route.ContainsKey("eventoId") ? route["eventoId"] :
                context.Controller is Controllers.EventosController && route.ContainsKey("id") ? route["id"] : null;
            if (eventoId != null && (!int.TryParse(eventoId.ToString(), out var id) ||
                !await db.Eventos.AnyAsync(e => e.Id == id && e.UserId == userId)))
            {
                context.Result = new ForbidResult();
                return;
            }
            await next();
        }
    }
}
