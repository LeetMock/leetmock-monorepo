# RequestEditorSnapshotsCreateArgsTerminal


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**execution_time** | **float** |  | [optional] 
**is_error** | **bool** |  | 
**output** | **str** |  | 

## Example

```python
from convex_client.models.request_editor_snapshots_create_args_terminal import RequestEditorSnapshotsCreateArgsTerminal

# TODO update the JSON string below
json = "{}"
# create an instance of RequestEditorSnapshotsCreateArgsTerminal from a JSON string
request_editor_snapshots_create_args_terminal_instance = RequestEditorSnapshotsCreateArgsTerminal.from_json(json)
# print the JSON string representation of the object
print(RequestEditorSnapshotsCreateArgsTerminal.to_json())

# convert the object into a dict
request_editor_snapshots_create_args_terminal_dict = request_editor_snapshots_create_args_terminal_instance.to_dict()
# create an instance of RequestEditorSnapshotsCreateArgsTerminal from a dict
request_editor_snapshots_create_args_terminal_from_dict = RequestEditorSnapshotsCreateArgsTerminal.from_dict(request_editor_snapshots_create_args_terminal_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


