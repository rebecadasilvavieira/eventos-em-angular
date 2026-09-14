using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProEventos.Application.Contratos;
using ProEventos.Application.Dtos;
using ProEventos.Domain.Identity;
using ProEventos.Persistence.Contratos;

namespace ProEventos.Application
{
    public class AccountService : IAccountService
    {

            private readonly UserManager<User> _userManager;
            private readonly SignInManager<User> _signInManager;
            private readonly IMapper _mapper;
            private readonly IUserPersist _userPersist;

            public AccountService(
                UserManager<User> userManager,
                SignInManager<User> signInManager,
                IMapper mapper,
                IUserPersist userPersist)
            {
                _userManager = userManager;
                _signInManager = signInManager;
                _mapper = mapper;
                _userPersist = userPersist;
            }

public async Task<SignInResult> CheckUserPasswordAsync(
    UserUpdateDto userUpdateDto,
    string password)
{
    try
    {
        var user = await _userManager.Users
            .SingleOrDefaultAsync(
                user => user.UserName.ToLower() == userUpdateDto.UserName.ToLower()
            );

        return await _signInManager.CheckPasswordSignInAsync(
            user,
            password,
            false
        );
    }
    catch (System.Exception ex)
    {
        throw new Exception(
            $"Erro ao tentar verificar password. Erro: {ex.Message}"
        );
    }
}
    public async Task<UserUpdateDto> CreateAccountAsync(UserDto userDto)
{
    try
    {
        var user = _mapper.Map<User>(userDto);
        user.Funcao = ProEventos.Domain.Enum.Funcao.Participante;
        var result = await _userManager.CreateAsync(user, userDto.Password);
        if (result.Errors.Any(error => error.Code == "DuplicateUserName"))
            throw new ArgumentException("este usuário já existe");

        if (result.Succeeded)
        {
            var userToReturn = _mapper.Map<UserUpdateDto>(user);
            return userToReturn;
        }
            return null;
    }

    catch (System.Exception ex)
    {
        if (ex is ArgumentException) throw;
        throw new Exception($"Erro ao tentar Criar Usuário. Erro: {ex.Message}");
    }
}
    

public async Task<UserUpdateDto> GetUserByUserNameAsync(string userName)
{
    try
    {
        var user = await _userPersist.GetUserByUserNameAsync(userName);
        if (user == null) return null;

        var userUpdateDto = _mapper.Map<UserUpdateDto>(user);
        var totais = await _userPersist.ContarEventosAsync(user.Id);
        userUpdateDto.TotalEventosCriados = totais.Criados;
        userUpdateDto.TotalEventosComoPalestrante = totais.ComoPalestrante;
        return userUpdateDto;
    }
    catch (System.Exception ex)
    {
        throw new Exception(
            $"Erro ao tentar pegar Usuário por Username. Erro: {ex.Message}"
        );
    }
}


        public async Task<UserUpdateDto> GetUserByIdAsync(int userId)
        {
            var user = await _userPersist.GetUserByIdAsync(userId);
            return user == null ? null : await GetUserByUserNameAsync(user.UserName);
        }

        public async Task<UserUpdateDto> UpdateAccount(UserUpdateDto userUpdateDto, int? authenticatedUserId = null)
        {
            try
            {
                var user = authenticatedUserId.HasValue
                    ? await _userPersist.GetUserByIdAsync(authenticatedUserId.Value)
                    : await _userPersist.GetUserByUserNameAsync(userUpdateDto.UserName);
                if (user == null) return null;

                userUpdateDto.UserName = userUpdateDto.UserName?.Trim();
                var existente = await _userPersist.GetUserByUserNameAsync(userUpdateDto.UserName);
                if (existente != null && existente.Id != user.Id)
                    throw new ArgumentException("este usuário já existe");

                userUpdateDto.Id = user.Id;

                _mapper.Map(userUpdateDto, user);
                user.NormalizedUserName = user.UserName.ToUpperInvariant();
                if(!string.IsNullOrEmpty(userUpdateDto.Password)){
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                await _userManager.ResetPasswordAsync(user, token, userUpdateDto.Password);
        }

                _userPersist.Update<User>(user);
                if (user.Funcao != ProEventos.Domain.Enum.Funcao.Palestrante)
                {
                    await _userPersist.RemoverVinculosComoPalestranteAsync(user.Id);
                }

                if (await _userPersist.SaveChangesAsync())
                {
                    var userRetorno = await _userPersist.GetUserByUserNameAsync(user.UserName);

                    return _mapper.Map<UserUpdateDto>(userRetorno);
                }

        return null;
        }
        catch (ArgumentException) { throw; }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("AspNetUsers.NormalizedUserName") == true)
        {
            throw new ArgumentException("este usuário já existe");
        }
        catch (System.Exception ex)
        {
            throw new Exception($"Erro ao tentar atualizar usuário. Erro: {ex.Message}");
        }
        }


public async Task<bool> UserExists(string userName)
{
    try
    {
        if (string.IsNullOrWhiteSpace(userName))
            return false;

        return await _userPersist.GetUserByUserNameAsync(userName.Trim()) != null;
    }
    catch (System.Exception ex)
    {
        throw new Exception(
            $"Erro ao verificar se usuário existe. Erro: {ex.Message}"
        );
    }
}


    }}
