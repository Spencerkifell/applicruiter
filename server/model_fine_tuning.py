from sentence_transformers import SentenceTransformer, InputExample, losses, evaluation
from sentence_transformers.readers import STSDataReader
from torch.utils.data import DataLoader

model_save_path = "model"

model = SentenceTransformer('all-mpnet-base-v2')

train_examples = [InputExample(texts=['My first sentence', 'My second sentence'], label=0.8),
                  InputExample(texts=['Another pair', 'Unrelated sentence'], label=0.3)]
train_batch_size = 16
train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=train_batch_size)
train_loss = losses.CosineSimilarityLoss(model=model)

sts_reader = STSDataReader('../data/quora', normalize_scores=True, s1_col_idx=4, s2_col_idx=5, score_col_idx=6, max_score=1)

evaluator = evaluation.EmbeddingSimilarityEvaluator.from_input_examples(sts_reader.get_examples('sts-dev.csv'))

model.fit(train_objectives=[(train_dataloader, train_loss)],
          evaluator=evaluator,
          epochs=5,
          evaluation_steps=1000,
          warmup_steps=5,
          output_path=model_save_path)