const mongoose = require('mongoose');

// 连接到 MongoDB 数据库
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// 定义数据模型
const MyModel = mongoose.model('MyModel', new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
}));


// 创建一个新的文档并保存
async function createDocument() {
  try {
    const newDocument = new MyModel({
      name: 'John Doe',
      age: 30,
      email: 'john.doe@example.com',
    });

    const savedDocument = await newDocument.save();
    console.log('Document saved:', savedDocument);
  } catch (err) {
    console.error('Error saving document:', err);
  }
}


createDocument();


// 关闭连接 (可选，在脚本结束时自动关闭)
// mongoose.connection.close();