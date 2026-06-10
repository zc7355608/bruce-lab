import { NextApiRequest, NextApiResponse } from "next";

/**
 * 1、API Routes允许您在Next.js应用内创建API端点。您可以通过在`pages/api`目录内创建具有以下格式的函数来实现此目的：
 */
export default (_: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ text: "Hello" });
};

// 2、它们可以部署为无服务器函数（Serverless Functions也称为Lambda）。
// 3、上面就是一个简单的Serverless Function示例，您可以通过访问`http://localhost:3000/api/hello`来测试它。你将会看到JSON内容输出：`{"text":"Hello"}`
// 4、API路由也可以是动态的，就像常规页面一样。

/**
 * API Routes的一个很好的用例是处理表单输入。
 * 例如，您可以在页面上创建一个表单，并让它向API Route发送POST请求。
 * 然后，您可以编写代码将其直接保存到数据库中。API Route代码不会成为客户端包的一部分，因此您可以安全地编写服务器端代码。
 */
