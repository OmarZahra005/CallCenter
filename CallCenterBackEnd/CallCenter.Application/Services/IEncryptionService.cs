namespace CallCenter.Application.Services;

/// <summary>
/// Service for encrypting and decrypting sensitive settings values.
/// </summary>
public interface IEncryptionService
{
    /// <summary>
    /// Encrypts a plain text value.
    /// </summary>
    /// <param name="plainText">The plain text to encrypt.</param>
    /// <returns>The encrypted value with ENC: prefix.</returns>
    string Encrypt(string plainText);

    /// <summary>
    /// Decrypts an encrypted value.
    /// </summary>
    /// <param name="cipherText">The encrypted text to decrypt.</param>
    /// <returns>The decrypted plain text.</returns>
    string Decrypt(string cipherText);

    /// <summary>
    /// Checks if a value is encrypted (has ENC: prefix).
    /// </summary>
    /// <param name="value">The value to check.</param>
    /// <returns>True if the value is encrypted.</returns>
    bool IsEncrypted(string value);
}
