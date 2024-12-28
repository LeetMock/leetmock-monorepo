# RequestQuestionsDeleteQuestionArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**question_id** | **str** | ID from table \&quot;questions\&quot; | 

## Example

```python
from convex_client.models.request_questions_delete_question_args import RequestQuestionsDeleteQuestionArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestQuestionsDeleteQuestionArgs from a JSON string
request_questions_delete_question_args_instance = RequestQuestionsDeleteQuestionArgs.from_json(json)
# print the JSON string representation of the object
print(RequestQuestionsDeleteQuestionArgs.to_json())

# convert the object into a dict
request_questions_delete_question_args_dict = request_questions_delete_question_args_instance.to_dict()
# create an instance of RequestQuestionsDeleteQuestionArgs from a dict
request_questions_delete_question_args_from_dict = RequestQuestionsDeleteQuestionArgs.from_dict(request_questions_delete_question_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


