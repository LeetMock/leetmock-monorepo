# RequestCodingQuestionSetAddQuestionToCodingQuestionSetArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**coding_question_set_name** | **str** |  | 
**question_id** | **str** | ID from table \&quot;questions\&quot; | 

## Example

```python
from convex_client.models.request_coding_question_set_add_question_to_coding_question_set_args import RequestCodingQuestionSetAddQuestionToCodingQuestionSetArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestCodingQuestionSetAddQuestionToCodingQuestionSetArgs from a JSON string
request_coding_question_set_add_question_to_coding_question_set_args_instance = RequestCodingQuestionSetAddQuestionToCodingQuestionSetArgs.from_json(json)
# print the JSON string representation of the object
print(RequestCodingQuestionSetAddQuestionToCodingQuestionSetArgs.to_json())

# convert the object into a dict
request_coding_question_set_add_question_to_coding_question_set_args_dict = request_coding_question_set_add_question_to_coding_question_set_args_instance.to_dict()
# create an instance of RequestCodingQuestionSetAddQuestionToCodingQuestionSetArgs from a dict
request_coding_question_set_add_question_to_coding_question_set_args_from_dict = RequestCodingQuestionSetAddQuestionToCodingQuestionSetArgs.from_dict(request_coding_question_set_add_question_to_coding_question_set_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


