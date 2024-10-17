# ResponseCodeSessionEventsGetNextContentChangeEventValue


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**acked** | **bool** |  | 
**event** | [**RequestCodeSessionEventsCommitCodeSessionEventArgsEventOneOf**](RequestCodeSessionEventsCommitCodeSessionEventArgsEventOneOf.md) |  | 
**id** | **str** | ID from table \&quot;codeSessionEvents\&quot; | 
**ts** | **float** |  | 

## Example

```python
from convex_client.models.response_code_session_events_get_next_content_change_event_value import ResponseCodeSessionEventsGetNextContentChangeEventValue

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodeSessionEventsGetNextContentChangeEventValue from a JSON string
response_code_session_events_get_next_content_change_event_value_instance = ResponseCodeSessionEventsGetNextContentChangeEventValue.from_json(json)
# print the JSON string representation of the object
print(ResponseCodeSessionEventsGetNextContentChangeEventValue.to_json())

# convert the object into a dict
response_code_session_events_get_next_content_change_event_value_dict = response_code_session_events_get_next_content_change_event_value_instance.to_dict()
# create an instance of ResponseCodeSessionEventsGetNextContentChangeEventValue from a dict
response_code_session_events_get_next_content_change_event_value_from_dict = ResponseCodeSessionEventsGetNextContentChangeEventValue.from_dict(response_code_session_events_get_next_content_change_event_value_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


