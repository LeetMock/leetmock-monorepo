# RequestQuestionsGetByIdInternalArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**question_id** | **str** | ID from table \&quot;questions\&quot; | 

## Example

```python
from convex_client.models.request_questions_get_by_id_internal_args import RequestQuestionsGetByIdInternalArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestQuestionsGetByIdInternalArgs from a JSON string
request_questions_get_by_id_internal_args_instance = RequestQuestionsGetByIdInternalArgs.from_json(json)
# print the JSON string representation of the object
print(RequestQuestionsGetByIdInternalArgs.to_json())

# convert the object into a dict
request_questions_get_by_id_internal_args_dict = request_questions_get_by_id_internal_args_instance.to_dict()
# create an instance of RequestQuestionsGetByIdInternalArgs from a dict
request_questions_get_by_id_internal_args_from_dict = RequestQuestionsGetByIdInternalArgs.from_dict(request_questions_get_by_id_internal_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


