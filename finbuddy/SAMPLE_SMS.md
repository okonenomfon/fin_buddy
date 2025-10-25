# Sample SMS Bank Alerts for Testing FinBuddy

Copy and paste these sample SMS alerts into FinBuddy to test the AI parsing functionality.

## Debit Transactions

### Shopping
```
Debit: ₦2,500 POS at Shoprite. Bal: ₦12,000
```

```
Your account has been debited with ₦15,000 for POS transaction at Mall Stores. Available Balance: ₦45,230
```

```
Debit Alert: NGN 5,500.00 POS Purchase at Spar Supermarket. Acct Bal: NGN 38,750.50
```

### Transport
```
Debit: ₦1,200 Uber trip payment. Bal: ₦23,450
```

```
Your account debited ₦3,500 for fuel purchase at Total Station. Balance: ₦19,200
```

```
Debit Alert: NGN 850 Bolt ride payment. Available Balance: NGN 22,350
```

### Food & Restaurant
```
Debit: ₦8,500 POS at Chicken Republic. Bal: ₦31,200
```

```
Your account has been debited ₦6,200 for transaction at Dominos Pizza. Balance: ₦25,000
```

```
Debit Alert: NGN 4,750 POS Purchase at KFC Restaurant. Acct Bal: NGN 28,450
```

### Airtime & Data
```
Debit: ₦1,000 Airtime purchase MTN. Bal: ₦18,500
```

```
Your account debited ₦2,500 for Glo data subscription. Balance: ₦16,000
```

```
Debit Alert: NGN 500 9mobile airtime recharge. Available Balance: NGN 15,500
```

### Entertainment
```
Debit: ₦3,500 Netflix subscription. Bal: ₦27,800
```

```
Your account debited ₦4,200 for Cinema ticket purchase. Balance: ₦23,600
```

### Utilities
```
Debit: ₦5,000 EKEDC bill payment. Bal: ₦32,100
```

```
Your account has been debited ₦3,200 for DSTV subscription. Balance: ₦28,900
```

### ATM Withdrawal
```
ATM Withdrawal: ₦10,000. Balance: ₦15,450
```

```
Debit Alert: NGN 20,000 ATM Cash Withdrawal at GTBank. Acct Bal: NGN 35,670
```

### Transfers
```
Debit: ₦25,000 Transfer to John Doe. Bal: ₦45,200
```

```
Your account debited ₦50,000 for Transfer to *****4532. Balance: ₦95,200
```

## Credit Transactions

### Salary
```
Credit: ₦150,000 Salary payment. Bal: ₦180,500
```

```
Your account has been credited with NGN 200,000.00 Monthly Salary. Available Balance: NGN 230,450
```

### Transfers Received
```
Credit: ₦50,000 Transfer from Mary Jane. Bal: ₦82,300
```

```
Your account credited ₦25,000 from *****1234. Balance: ₦107,300
```

```
Credit Alert: NGN 10,000 received via bank transfer. Acct Bal: NGN 117,300
```

### Refunds
```
Credit: ₦5,500 Refund from Amazon. Bal: ₦122,800
```

```
Your account has been credited NGN 3,200 Reversal of transaction. Balance: NGN 126,000
```

## Various Formats

### Format 1 (GTBank style)
```
Acct: XXXX4532
Desc: POS Purchase
Amt: NGN 3,450.00
Loc: Shoprite
Bal: NGN 45,670.50
Date: 15-Jan-2025
```

### Format 2 (Access Bank style)
```
Dear Customer, your account has been debited. 
Amount: N12,500.00
Description: Web Purchase - Jumia
Balance: N67,890.00
Thank you.
```

### Format 3 (First Bank style)
```
DR
Amt: NGN5,000.00
Desc: Transfer
Bal: NGN42,350.00
```

### Format 4 (Zenith Bank style)
```
Acct:**4532
Txn:POS
Amt:NGN8,750.00
Desc:Payment at Spar
Bal:NGN56,230.00
```

## Tips for Testing

1. **Start with simple formats** - Use the basic "Debit: ₦X at Y. Bal: ₦Z" format first
2. **Test different categories** - Try one SMS from each category to see categorization
3. **Mix formats** - Test various bank formats to see the AI's parsing flexibility
4. **Test edge cases** - Try alerts with unusual wording or formatting
5. **Check balance tracking** - Notice how the balance updates after each transaction

## Expected AI Behavior

The AI should extract:
- **Type:** debit or credit
- **Amount:** Numerical value (without currency symbol)
- **Category:** One of: food, transport, airtime, shopping, entertainment, utilities, transfer, salary, other
- **Vendor:** Merchant name or "Unknown"
- **Balance:** Account balance after transaction (if mentioned)

## Common Issues

If parsing fails, the system will:
1. Try the regex fallback parser
2. Still create the transaction with extracted data
3. Show a success message

The AI is trained to be forgiving with formatting variations!
