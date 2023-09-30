from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from transformers import pipeline

similarityModel = SentenceTransformer('multi-qa-mpnet-base-dot-v1')
sentimentAnalysisModel = pipeline('sentiment-analysis', 'distilbert-base-uncased-finetuned-sst-2-english')

jobs = ["We are looking for a professional banana eater with decades of experience."]

resumes = ["I have many skills, such as eating 2 bananas at once.",
           "I've eaten bananas before, I guess.",
           "Banana-eating world champion 2013-2023. One decade, baby.",
           "ehhh."]

jobEmbeddings = similarityModel.encode(jobs)
resumeEmbeddings = similarityModel.encode(resumes)

for job, jobEmbedding in zip(jobs, jobEmbeddings):
    jobEmbedding = jobEmbedding.reshape(1, -1)
    print('Job:', job)
    print('')
    for resume, resumeEmbedding in zip(resumes, resumeEmbeddings):
        resumeEmbedding = resumeEmbedding.reshape(1, -1)
        similarity = cosine_similarity(resumeEmbedding, jobEmbedding)[0][0]
        print('Resume:', resume)
        print('Similarity:', similarity)
        print('')

# Find the top-10 resumes predicted by the KNN algorithm using Cosine similarity value




# Sentiment analysis
'''
for resume in resumes:
    sentimentResult = sentimentAnalysisModel(resume)
    print(sentimentResult[0]['label'], sentimentResult[0]['score'])
'''
