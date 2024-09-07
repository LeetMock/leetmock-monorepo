# ResponseActionsGetEditorSnapshot


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | [**ResponseActionsGetEditorSnapshotValue**](ResponseActionsGetEditorSnapshotValue.md) |  | [optional] 

## Example

```python
from convex_client.models.response_actions_get_editor_snapshot import ResponseActionsGetEditorSnapshot

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsGetEditorSnapshot from a JSON string
response_actions_get_editor_snapshot_instance = ResponseActionsGetEditorSnapshot.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsGetEditorSnapshot.to_json())

# convert the object into a dict
response_actions_get_editor_snapshot_dict = response_actions_get_editor_snapshot_instance.to_dict()
# create an instance of ResponseActionsGetEditorSnapshot from a dict
response_actions_get_editor_snapshot_from_dict = ResponseActionsGetEditorSnapshot.from_dict(response_actions_get_editor_snapshot_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


