# API 服务 #
为外部系统调用设计。

> **注意:**
> - 所有的URL前缀为/api/v1，如/wallet/new的完整URL路径是/api/v1/wallet/new
> - 所有的返回值都包含success，成功为true，失败为false。成功代表提交，不保证写入账本。

## API 说明 ##

#### 账户 ####

* [生成钱包 - GET - /wallet/new](#生成钱包)
* [查询余额 - GET - /account/{:address}/balances](#查询余额)

#### 转账 ####

* [转账 - POST - /account/{:source_address}/payments](#转账)
* [查询转账 - GET - /account/{:address}/payments/{:hash}](#查询转账)
* [查询历史 - GET - /account/{:address}/payments](#查询历史)

## 生成钱包 ##

随机生成一个新的钱包，返回地址和私钥。

```
GET /api/v1/wallet/new
```

*注意:* 有私钥就能完整控制钱包。所以不要将私钥在非安全的服务器和非HTTPS互联网上转输。

#### 返回值 ####

```js
{
    "success": true,
	"account": {
		"address": "0xffDF1F2881f0f8C5b2B572a261c85058D5a113B7",
		"secret": "a549e1e4374b3c69452339a5812c23451072fd67a9a06c37394d0e00f9f70a7b"
	}
}
```

## 查询余额 ##

```
GET /api/v1/account/{:address}/balances
```

必填参数:

| Field | Type | Description |
|-------|------|-------------|
| address | String | 所查询账户的地址 |

#### 返回值 ####

```js
{
  "success": true,
  "balances": [
    {
      "currency": "PANDA",
      "amount": "1046.29877312",
      "issuer": "0xff..."
    },
    {
      "currency": "CNY",
      "amount": "512.79",
      "issuer": "0xfa...",
    }
    ...
  ]
}
```

## 转账 ##

```
POST /api/v1/accounts/{address}/payments

{
  "secret": "a5...",
  "payment": {
    "destination_account": "0xf01...",
    "currency" : "PANDA",
    "amount" : "5.01",
    "issuer" : "0x11..."
  }
}
```

请求的JSON对象包含以下参数:

| Field | Type | Description |
|-------|------|-------------|
| address | String | 发起转账账户的地址 |
| secret | String | 账户私钥 |
| payment | Payment object | 包含目标账户，货币代码和金额，发行方issuer选填 |

__不要将私钥发送到不安全的API REST服务器上__

#### 返回值 ####

```js
{
  "success": true,
  "hash": "C32A85BA3EE9071D35E583D9062E5B8C327C28BB834B45B882651DD7E50CEA1C"
}
```

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | `true` 代表请求被当然账本接受，不代表最终在账本中生效。|
| hash | String | 唯一的hash值，代表本次操作 |
