# Documentation: 
# https://github.com/SohierDane/BigQuery_Helper/tree/master
# https://www.kaggle.com/code/sohier/introduction-to-the-bq-helper-package

# References for the datasets:
# https://www.kaggle.com/datasets/jojo1000/facebook-last-names-with-count
# https://www.kaggle.com/datasets/datagov/usa-names/data

# Summary:
# We'll create a custom NER model using spaCy to extract names from candidates' resumes. For this task, we'll leverage two datasets from Kaggle—one containing first names and the other containing last names. The dataset of last names, obtained from a Facebook dataset, will undergo processing using text and pandas. Meanwhile, the dataset of first names, sourced from a Kaggle dataset, will be queried using BigQuery_Helper, a library that facilitates SQL-syntax-based querying of BigQuery datasets.

import spacy
import csv
import os
from spacy.training.example import Example

# Create a blank spaCy model
nlp = spacy.blank("en")

# Define two NER components for first names and last names
ner_first_name = nlp.add_pipe("ner", name="FIRST_NAME")
ner_last_name = nlp.add_pipe("ner", name="LAST_NAME")

# Initialize a list to store training examples
train_examples = []

# Load data from the CSV file (First Names)
with open('data/output_first_names.csv', 'r', newline='') as csv_file:
    reader = csv.DictReader(csv_file)

    # Iterate through the rows in the CSV
    for row in reader:
        first_name = row['name']
        # Define training data for first names: (name, {"entities": [(start, end, "LABEL")]})
        first_name_annotations = {"text": first_name, "entities": [(0, len(first_name), "FIRST_NAME")]}
        doc = nlp.make_doc(first_name)
        example = Example.from_dict(doc, first_name_annotations)
        train_examples.append(example)
        ner_first_name.add_label("FIRST_NAME")
    
# Load data from the CSV file (Last Names)
with open('data/output_last_names.csv', 'r', newline='') as csv_file:
    reader = csv.DictReader(csv_file)
    
    # Iterate through the rows in the CSV
    for row in reader:
        last_name = row['Name']
        # Define training data for first names: (name, {"entities": [(start, end, "LABEL")]})
        last_name_annotations = {"text": last_name, "entities": [(0, len(last_name), "LAST_NAME")]}
        doc = nlp.make_doc(last_name)
        example = Example.from_dict(doc, last_name_annotations)
        train_examples.append(example)
        ner_last_name.add_label("LAST_NAME")

# Train the NER model

nlp.begin_training()

# Train for 50 iterations of the training data
for iteration in range(50):
    print(f"Starting iteration {iteration + 1}")
    loss = 0.0

    # Iterate through the training examples
    for example in train_examples:
        # Update the model with the example
        nlp.update([example], drop=0.5)

        # Accumulate the loss for this example
        loss += nlp.get_pipe("ner").last_loss

    # Calculate and print the average loss for the iteration
    average_loss = loss / len(train_examples)
    print(f"Iteration {iteration + 1} - Average Loss: {average_loss:.4f}")

abs_path = os.path.abspath(".") 
nlp.to_disk("ner_names_model", path=f"{abs_path}/model")