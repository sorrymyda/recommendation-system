from flask import Flask, request, jsonify
import pandas as pd
import torch
from transformers import BertTokenizer, BertModel

app = Flask(__name__)

# 加载 BERT 模型和分词器
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model = BertModel.from_pretrained("bert-base-uncased")

# 示例餐厅数据
restaurants_df = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["餐厅A", "餐厅B", "餐厅C"],
    "description": [
        "提供正宗的四川火锅，服务热情周到。",
        "环境优雅，菜品精致，适合商务宴请。",
        "价格实惠，菜品丰富，适合家庭聚餐。"
    ],
    "rating": [4.8, 4.5, 4.2],
    "price": [150, 200, 80],
    "region": ["北京", "上海", "广州"]
})

# 使用 BERT 编码文本
def encode_text(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].squeeze()

# 内容-based推荐
@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json
    region = data.get("region", "")
    preference = data.get("preference", "")

    # 过滤地区
    filtered_restaurants = restaurants_df[restaurants_df["region"] == region]

    # 编码用户偏好
    user_preference_embedding = encode_text(preference)

    # 编码餐厅描述
    restaurant_embeddings = []
    for desc in filtered_restaurants["description"]:
        embeddings = encode_text(desc)
        restaurant_embeddings.append(embeddings)
    restaurant_embeddings = torch.stack(restaurant_embeddings)

    # 计算相似度
    similarities = torch.nn.functional.cosine_similarity(
        user_preference_embedding.unsqueeze(0),
        restaurant_embeddings
    ).tolist()

    # 添加相似度到 DataFrame
    filtered_restaurants["similarity"] = similarities

    # 返回推荐结果
    recommendations = filtered_restaurants.sort_values(by="similarity", ascending=False).head(5)
    return jsonify(recommendations.to_dict(orient="records"))

# 推荐附近景点
@app.route("/nearby-attractions", methods=["POST"])
def nearby_attractions():
    data = request.json
    region = data.get("region", "")

    # 示例景点数据
    attractions_df = pd.DataFrame({
        "id": [1, 2, 3],
        "name": ["故宫", "外滩", "广州塔"],
        "city": ["北京", "上海", "广州"]
    })

    # 过滤地区
    filtered_attractions = attractions_df[attractions_df["city"] == region]
    return jsonify(filtered_attractions.to_dict(orient="records"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)