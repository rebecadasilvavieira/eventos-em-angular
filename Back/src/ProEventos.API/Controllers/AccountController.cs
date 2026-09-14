using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProEventos.Api.Helpers;
using ProEventos.API.Extensions;
using ProEventos.Application.Contratos;
using ProEventos.Application.Dtos;

namespace ProEventos.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly ITokenService _tokenService;
        private readonly IUtil _util;

        private readonly string _destino = "Images";

        public AccountController(IAccountService accountService,
                                 ITokenService tokenService,
                                 IUtil util)
        {
            _util = util;
            _accountService = accountService;
            _tokenService = tokenService;
        }

        [HttpGet("GetUser")]
        public async Task<IActionResult> GetUser()
        {
            try
            {
                var user = await _accountService.GetUserByIdAsync(User.GetUserId());
                if (user == null) return Unauthorized("Usuário não encontrado.");
                return Ok(user);
            }
            catch (ArgumentException ex) when (ex.Message == "este usuário já existe") { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError,
                    $"Erro ao tentar recuperar Usuário. Erro: {ex.Message}");
            }
        }


        [HttpGet("username-exists")]
        [AllowAnonymous]
        public async Task<IActionResult> UserNameExists([FromQuery] string userName, [FromQuery] bool editing = false)
        {
            var existente = string.IsNullOrWhiteSpace(userName) ? null :
                await _accountService.GetUserByUserNameAsync(userName.Trim());
            var proprio = editing && User.Identity.IsAuthenticated && existente?.Id == User.GetUserId();
            return Ok(new { exists = existente != null && !proprio });
        }

        [HttpPost("Register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(UserDto userDto)
        {
            try
            {
                userDto.UserName = userDto.UserName?.Trim();
                if (await _accountService.UserExists(userDto.UserName))
                    return Conflict("este usuário já existe");

                var user = await _accountService.CreateAccountAsync(userDto);
                if (user != null)
                    return Ok(new
                    {
                        userName = user.UserName,
                        PrimeroNome = user.PrimeiroNome,
                        token = _tokenService.CreateToken(user).Result
                    });

                return BadRequest("Usuário não criado, tente novamente mais tarde!");
            }
            catch (ArgumentException ex) when (ex.Message == "este usuário já existe") { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError,
                    $"Erro ao tentar Registrar Usuário. Erro: {ex.Message}");
            }
        }

        [HttpPost("Login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(UserLoginDto userLogin)
        {
            try
            {
                var user = await _accountService.GetUserByUserNameAsync(userLogin.Username);
                if (user == null) return Unauthorized("Usuário ou Senha está errado");

                var result = await _accountService.CheckUserPasswordAsync(user, userLogin.Password);
                if (!result.Succeeded) return Unauthorized();

                return Ok(new
                {
                    userName = user.UserName,
                    PrimeroNome = user.PrimeiroNome,
                    token = _tokenService.CreateToken(user).Result
                });
            }
            catch (ArgumentException ex) when (ex.Message == "este usuário já existe") { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError,
                    $"Erro ao tentar realizar Login. Erro: {ex.Message}");
            }
        }

        [HttpPut("UpdateUser")]
        public async Task<IActionResult> UpdateUser(UserUpdateDto userUpdateDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userUpdateDto.UserName)) return BadRequest("Usuário é obrigatório.");
                var user = await _accountService.GetUserByIdAsync(User.GetUserId());
                if (user == null) return Unauthorized("Usuário Inválido");

                // A foto e atualizada exclusivamente pelo endpoint de upload.
                userUpdateDto.ImagemURL = user.ImagemURL;
                var userReturn = await _accountService.UpdateAccount(userUpdateDto, User.GetUserId());
                if (userReturn == null) return NoContent();

                return Ok(new
                {
                    userName = userReturn.UserName,
                    PrimeroNome = userReturn.PrimeiroNome,
                    token = _tokenService.CreateToken(userReturn).Result
                });
            }
            catch (ArgumentException ex) when (ex.Message == "este usuário já existe") { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError,
                    $"Erro ao tentar Atualizar Usuário. Erro: {ex.Message}");
            }
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage()
        {
            try
            {
                var user = await _accountService.GetUserByIdAsync(User.GetUserId());
                if (user == null) return NoContent();

                var file = Request.Form.Files[0];
                if (file.Length > 0)
                {
                    _util.DeleteImage(user.ImagemURL, _destino);
                    user.ImagemURL = await _util.SaveImage(file, _destino);
                }
                var userRetorno = await _accountService.UpdateAccount(user);

                return Ok(userRetorno);
            }
            catch (ArgumentException ex) when (ex.Message == "este usuário já existe") { return Conflict(ex.Message); }
            catch (Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError,
                    $"Erro ao tentar realizar upload de Foto do Usuário. Erro: {ex.Message}");
            }
        }
    }
}
