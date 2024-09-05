# RequestEditorSnapshotsCreateArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**editor** | [**RequestEditorSnapshotsCreateArgsEditor**](RequestEditorSnapshotsCreateArgsEditor.md) |  | 
**session_id** | **str** | ID from table \&quot;sessions\&quot; | 
**terminal** | [**RequestEditorSnapshotsCreateArgsTerminal**](RequestEditorSnapshotsCreateArgsTerminal.md) |  | 

## Example

```python
from convex_client.models.request_editor_snapshots_create_args import RequestEditorSnapshotsCreateArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestEditorSnapshotsCreateArgs from a JSON string
request_editor_snapshots_create_args_instance = RequestEditorSnapshotsCreateArgs.from_json(json)
# print the JSON string representation of the object
print(RequestEditorSnapshotsCreateArgs.to_json())

# convert the object into a dict
request_editor_snapshots_create_args_dict = request_editor_snapshots_create_args_instance.to_dict()
# create an instance of RequestEditorSnapshotsCreateArgs from a dict
request_editor_snapshots_create_args_from_dict = RequestEditorSnapshotsCreateArgs.from_dict(request_editor_snapshots_create_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


