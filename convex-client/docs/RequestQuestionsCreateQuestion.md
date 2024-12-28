# RequestQuestionsCreateQuestion


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**RequestQuestionsCreateQuestionArgs**](RequestQuestionsCreateQuestionArgs.md) |  | 

## Example

```python
from convex_client.models.request_questions_create_question import RequestQuestionsCreateQuestion

# TODO update the JSON string below
json = "{}"
# create an instance of RequestQuestionsCreateQuestion from a JSON string
request_questions_create_question_instance = RequestQuestionsCreateQuestion.from_json(json)
# print the JSON string representation of the object
print(RequestQuestionsCreateQuestion.to_json())

# convert the object into a dict
request_questions_create_question_dict = request_questions_create_question_instance.to_dict()
# create an instance of RequestQuestionsCreateQuestion from a dict
request_questions_create_question_from_dict = RequestQuestionsCreateQuestion.from_dict(request_questions_create_question_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


