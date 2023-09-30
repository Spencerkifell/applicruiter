from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('multi-qa-mpnet-base-dot-v1')

jobs = ["We are looking for a professional banana eater with decades of experience."]

resumes = ["I have many skills, such as eating 2 bananas at once.",
           "I've eaten bananas before, I guess, but I'm not too confident.",
           "Banana-eating world champion 2013-2023. One decade, baby.",
           "ligma balls"]

jobEmbeddings = model.encode(jobs)
resumeEmbeddings = model.encode(resumes)

for job, jobEmbedding in zip(jobs, jobEmbeddings):
    jobEmbedding = jobEmbedding.reshape(1, -1)
    print("Job:", job)
    print("")
    for resume, resumeEmbedding in zip(resumes, resumeEmbeddings):
        resumeEmbedding = resumeEmbedding.reshape(1, -1)
        similarity = cosine_similarity(resumeEmbedding, jobEmbedding)[0][0]
        print("Resume:", resume)
        print("Similarity:", similarity)
        print("")

'''
embedding1 = model.encode(sentence1).reshape(1, -1)
embedding2 = model.encode(sentence2).reshape(1, -1)

similarity = cosine_similarity(embedding1, embedding2)[0][0]
print(similarity)
'''
