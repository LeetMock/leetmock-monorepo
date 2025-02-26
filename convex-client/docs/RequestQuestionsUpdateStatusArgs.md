# RequestQuestionsUpdateStatusArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**question_id** | **str** | ID from table \&quot;questions\&quot; | 
**status** | **str** |  | 

## Example

```python
from convex_client.models.request_questions_update_status_args import RequestQuestionsUpdateStatusArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestQuestionsUpdateStatusArgs from a JSON string
request_questions_update_status_args_instance = RequestQuestionsUpdateStatusArgs.from_json(json)
# print the JSON string representation of the object
print(RequestQuestionsUpdateStatusArgs.to_json())

# convert the object into a dict
request_questions_update_status_args_dict = request_questions_update_status_args_instance.to_dict()
# create an instance of RequestQuestionsUpdateStatusArgs from a dict
request_questions_update_status_args_from_dict = RequestQuestionsUpdateStatusArgs.from_dict(request_questions_update_status_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


