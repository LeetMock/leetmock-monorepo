# ResponseActionsGetSessionMetadataValue


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**agent_thread_id** | **str** |  | 
**assistant_id** | **str** |  | 
**interview_flow** | **List[str]** |  | 
**interview_mode** | **str** |  | 
**interview_type** | **str** |  | 
**metadata** | **object** |  | 
**model_name** | **str** |  | 
**programming_language** | **str** |  | 
**question_content** | **str** |  | 
**question_id** | **str** | ID from table \&quot;questions\&quot; | 
**question_title** | **str** |  | 
**session_id** | **str** | ID from table \&quot;sessions\&quot; | 
**session_status** | **str** |  | 
**voice** | **str** |  | 

## Example

```python
from convex_client.models.response_actions_get_session_metadata_value import ResponseActionsGetSessionMetadataValue

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsGetSessionMetadataValue from a JSON string
response_actions_get_session_metadata_value_instance = ResponseActionsGetSessionMetadataValue.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsGetSessionMetadataValue.to_json())

# convert the object into a dict
response_actions_get_session_metadata_value_dict = response_actions_get_session_metadata_value_instance.to_dict()
# create an instance of ResponseActionsGetSessionMetadataValue from a dict
response_actions_get_session_metadata_value_from_dict = ResponseActionsGetSessionMetadataValue.from_dict(response_actions_get_session_metadata_value_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


