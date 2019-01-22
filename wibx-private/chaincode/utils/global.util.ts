///
/// Check if the given amount is valid.
///
/// @param amount The amount
///
function isAmountValid(amount: number): void
{
    assert(amount >= 0, 'Invalid amount! Should be <= 0');
    //assert(Number(amount) === amount && amount % 1 === 0, 'Floats are not permitted.');
}