# API 服务 #
为外部系统调用设计。

> **注意:**
> 所有的URL前缀为/api/v1，如/wallet/new的完整URL路径是/api/v1/wallet/new

## API 说明 ##

#### 账户 ####

* [生成钱包 - GET - /wallet/new](#生成钱包)
* [查询余额 - GET - /account/{:address}/balances](#查询余额)


## 生成钱包 ##

随机生成一个新的钱包，返回地址和私钥。

```
GET /v1/wallet/new
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
GET /v1/account/{:address}/balances
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

