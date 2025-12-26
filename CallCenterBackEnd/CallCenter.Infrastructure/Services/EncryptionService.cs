using System.Security.Cryptography;
using System.Text;
using CallCenter.Application.Services;
using Microsoft.Extensions.Configuration;

namespace CallCenter.Infrastructure.Services;

/// <summary>
/// AES-256 encryption service for sensitive settings values.
/// </summary>
public class EncryptionService : IEncryptionService
{
    private readonly byte[] _key;
    private readonly byte[] _iv;
    private const string EncryptionPrefix = "ENC:";

    public EncryptionService(IConfiguration configuration)
    {
        // Key should be from environment variable for security
        var encryptionKey = Environment.GetEnvironmentVariable("SETTINGS_ENCRYPTION_KEY")
            ?? configuration["EncryptionKey"]
            ?? "CallCenter_Default_Encryption_Key_2024!";

        // Generate 32-byte key for AES-256 using SHA256
        _key = SHA256.HashData(Encoding.UTF8.GetBytes(encryptionKey));

        // Generate 16-byte IV using MD5
        _iv = MD5.HashData(Encoding.UTF8.GetBytes(encryptionKey));
    }

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            return plainText;

        // Don't re-encrypt already encrypted values
        if (IsEncrypted(plainText))
            return plainText;

        using var aes = Aes.Create();
        aes.Key = _key;
        aes.IV = _iv;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var encryptedBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

        return EncryptionPrefix + Convert.ToBase64String(encryptedBytes);
    }

    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText))
            return cipherText;

        // Only decrypt if it has the encryption prefix
        if (!IsEncrypted(cipherText))
            return cipherText;

        var base64 = cipherText.Substring(EncryptionPrefix.Length);

        using var aes = Aes.Create();
        aes.Key = _key;
        aes.IV = _iv;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        var cipherBytes = Convert.FromBase64String(base64);
        var decryptedBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);

        return Encoding.UTF8.GetString(decryptedBytes);
    }

    public bool IsEncrypted(string value)
    {
        return !string.IsNullOrEmpty(value) && value.StartsWith(EncryptionPrefix);
    }
}
