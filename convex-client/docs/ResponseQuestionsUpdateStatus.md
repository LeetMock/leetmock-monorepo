# ResponseQuestionsUpdateStatus


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_questions_update_status import ResponseQuestionsUpdateStatus

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseQuestionsUpdateStatus from a JSON string
response_questions_update_status_instance = ResponseQuestionsUpdateStatus.from_json(json)
# print the JSON string representation of the object
print(ResponseQuestionsUpdateStatus.to_json())

# convert the object into a dict
response_questions_update_status_dict = response_questions_update_status_instance.to_dict()
# create an instance of ResponseQuestionsUpdateStatus from a dict
response_questions_update_status_from_dict = ResponseQuestionsUpdateStatus.from_dict(response_questions_update_status_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


